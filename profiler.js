const fs = require("fs");
const path = require("path");

module.exports.profileWrapFn = async (fn, opts) => {
  opts = opts || {};
  const { type, sampleInterval = 1 * 1000 } = opts;
  if (type && type != 'CPU_PROFILE' && type != 'HEAP_SNAPSHOT' && type != 'HEAP_PROFILE') {
    throw new Error('Profiler: unknown profile type.');
  }

  let before = async () => { };
  let after = async () => { };

  // Call fn after interval ms, wait for it to finish, then repeat.
  // Returns a callback that calls fn one last time and stops repeating.
  const rollingTimeout = (fn, interval) => {
    let lastTimeout;
    const chainedTimeout = () =>
      lastTimeout = setTimeout(async () => {
        await fn();
        chainedTimeout();
      }, interval);

    chainedTimeout();

    const stopCb = async () => {
      clearTimeout(lastTimeout);
      await fn();
    };

    return stopCb;
  };

  // Check if we need to profile this run.
  if (type) {
    // No colons ISO format, suitable for filenames.
    const basicISONow = () => new Date().toISOString().replace(/[-.:]/g, '');
    const inspector = require('inspector');
    const promisify = require('util').promisify;
    const session = new inspector.Session();

    // Adding a method because of https://github.com/nodejs/node/issues/13338#issuecomment-307165905.
    session.postPromise = promisify(session.post);
    session.connect();

    if (type == 'CPU_PROFILE') {
      console.error('\nProfiler: taking CPU profile');
      // Start the CPU profiler.
      before = async () => {
        await session.postPromise('Profiler.enable');
        await session.postPromise('Profiler.start');
      };

      // Save the CPU profile after execution has finished.
      after = async () => {
        const { profile } = await session.postPromise('Profiler.stop');
        const profilePath = path.resolve(process.cwd(), `PROFILE_${basicISONow()}.cpuprofile`);
        fs.writeFileSync(profilePath, JSON.stringify(profile));
        console.error('\nProfiler: saved CPU profile to', profilePath);
      };
    } else if (type == 'HEAP_SNAPSHOT') {
      console.error('\nProfiler: taking heap snapshots');
      // Take a single heap snapshot, and wait for it to be written to disk.
      // These snapshots can be quite big and also take some time to write, so they shouldn't be
      // written too frequently.
      const writeHeapSnapshot = async () => {
        const profilePath = path.resolve(process.cwd(), `PROFILE_${basicISONow()}.heapsnapshot`);
        console.error('\nProfiler: saving heap snapshot to', profilePath);
        // TODO: figure out why I sometimes get the errors below
        // (node:1260) [EPERM] Error: EPERM: operation not permitted, write
        const fd = fs.openSync(profilePath, 'w');

        session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
          fs.writeSync(fd, m.params.chunk);
        });

        await session.postPromise('HeapProfiler.writeHeapSnapshot');
        fs.closeSync(fd);
        console.error('\nProfiler: saved heap snapshot to', profilePath);
      }

      // Create a heap snapshot every sampleInterval seconds.
      let stopCb;
      before = async () => stopCb = rollingTimeout(writeHeapSnapshot, sampleInterval);
      after = async () => stopCb();
    } else if (type == 'HEAP_PROFILE') {
      console.error('\nProfiler: taking heap profile');
      // Take a single heap snapshot, and wait for it to be written to disk.
      const writeHeapProfile = async () => {
        const { profile } = await session.postPromise('HeapProfiler.getSamplingProfile');
        const profilePath = path.resolve(process.cwd(), `PROFILE_${basicISONow()}.heapprofile`);
        fs.writeFileSync(profilePath, JSON.stringify(profile));
        console.error('\nProfiler: saved heap profile to', profilePath);
      }

      // Start the heap profiler. Create a heap profile every sampleInterval seconds.
      let stopCb;
      before = async () => {
        await session.postPromise('HeapProfiler.enable');
        await session.postPromise('HeapProfiler.startSampling');
        stopCb = rollingTimeout(writeHeapProfile, sampleInterval);
      };
      after = async () => stopCb();
    }
  }


  await before();
  const fnResult = await fn();
  await after();
  return fnResult;
}