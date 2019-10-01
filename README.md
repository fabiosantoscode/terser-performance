# terser-performance

Repo to benchmark performance of [Terser](https://github.com/terser/terser).

## Usage

```
git clone https://github.com/filipesilva/terser-performance.git
npm install
npm test
```

You should see something similar to this:
```
$ npm test

> terser-performance@1.0.0 test D:\sandbox\terser-performance
> npm run benchmark && npm run profile


> terser-performance@1.0.0 benchmark D:\sandbox\terser-performance
> npm run benchmark-medium && npm run benchmark-large


> terser-performance@1.0.0 benchmark-medium D:\sandbox\terser-performance
> benchmark -- node run-terser.js ./medium-sample.js

[benchmark] Benchmarking process over 5 iterations, with up to 5 retries.
[benchmark]   node run-terser.js ./medium-sample.js (at D:\sandbox\terser-performance)
[benchmark] Process Stats
[benchmark]   Elapsed Time: 3953.00 ms (3745.00, 3768.00, 4128.00, 4152.00, 3972.00)
[benchmark]   Average Process usage: 1.00 process(es) (1.00, 1.00, 1.00, 1.00, 1.00)
[benchmark]   Peak Process usage: 1.00 process(es) (1.00, 1.00, 1.00, 1.00, 1.00)
[benchmark]   Average CPU usage: 10.09 % (8.38, 9.37, 12.71, 11.47, 8.54)
[benchmark]   Peak CPU usage: 51.56 % (45.40, 48.40, 65.50, 53.20, 45.30)
[benchmark]   Average Memory usage: 124.49 MB (123.21, 121.55, 130.48, 123.46, 123.75)
[benchmark]   Peak Memory usage: 158.65 MB (157.22, 155.60, 160.69, 160.14, 159.61)

> terser-performance@1.0.0 benchmark-large D:\sandbox\terser-performance
> benchmark -- node run-terser.js ./large-sample.js

[benchmark] Benchmarking process over 5 iterations, with up to 5 retries.
[benchmark]   node run-terser.js ./large-sample.js (at D:\sandbox\terser-performance)
[benchmark] Process Stats
[benchmark]   Elapsed Time: 29140.20 ms (25791.00, 28231.00, 30336.00, 30615.00, 30728.00)
[benchmark]   Average Process usage: 1.00 process(es) (1.00, 1.00, 1.00, 1.00, 1.00)
[benchmark]   Peak Process usage: 1.00 process(es) (1.00, 1.00, 1.00, 1.00, 1.00)
[benchmark]   Average CPU usage: 13.52 % (11.48, 12.30, 15.04, 13.91, 14.88)
[benchmark]   Peak CPU usage: 98.74 % (112.50, 76.50, 112.50, 68.80, 123.40)
[benchmark]   Average Memory usage: 425.00 MB (422.54, 426.24, 422.82, 424.08, 429.33)
[benchmark]   Peak Memory usage: 589.08 MB (588.97, 588.98, 588.83, 592.81, 585.82)

> terser-performance@1.0.0 profile D:\sandbox\terser-performance
> npm run profile-medium && npm run profile-large


> terser-performance@1.0.0 profile-medium D:\sandbox\terser-performance
> node run-terser.js medium-sample.js CPU_PROFILE && node run-terser.js medium-sample.js HEAP_PROFILE


Profiler: taking CPU profile

Profiler: saved CPU profile to D:\sandbox\terser-performance\PROFILE_20191001T113704685Z.cpuprofile

Profiler: taking heap profile

Profiler: saved heap profile to D:\sandbox\terser-performance\PROFILE_20191001T113709715Z.heapprofile

> terser-performance@1.0.0 profile-large D:\sandbox\terser-performance
> node run-terser.js large-sample.js CPU_PROFILE && node run-terser.js large-sample.js HEAP_PROFILE


Profiler: taking CPU profile

Profiler: saved CPU profile to D:\sandbox\terser-performance\PROFILE_20191001T113737368Z.cpuprofile

Profiler: taking heap profile

Profiler: saved heap profile to D:\sandbox\terser-performance\PROFILE_20191001T113818837Z.heapprofile
```

The output prefixed with `[benchmark]` shows time, cpu, and memory resource usage.

The `.cpuprofile` and `.heapprofile` files contain a detailed profiled that can be opened in Google Chrome.
To see the profiles, open <chrome://inspect/#devices> on Chrome, then click `Open dedicated DevTools for Node`. 
The `.cpuprofile` file shows how time was used per function and should be loaded in the `Profiler` tab.
The `.heapprofile` file shows how memory was used per function and should be opened in the `Memory` tab.
After loading them you can zoom, pan, and mouseover individual functions for more details.
There is also different kinds of views available on the downwards arrow by `Chart` on the topleft.

You can use `git clean -fx` to clean up all the ignored output files after a benchmark. 
The `node_modules` folder is ignored but won't be deleted.


## Individual benchmark tasks

This repository contains two sample files to use with Terser: `medium-sample.js` and `large-sample.js`.

The following npm scripts benchmark Terser performance with those two files.

- `npm run benchmark-medium`
- `npm run benchmark-large`
- `npm run benchmark` (runs both above)
- `npm run profile-medium`
- `npm run profile-large`
- `npm run profile` (runs both above)