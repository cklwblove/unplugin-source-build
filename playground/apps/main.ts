import { strAdd } from 'source-build-utils';

document.getElementById('app')!.innerHTML = strAdd(
  '__UNPLUGIN__',
  'SOURCE_BUILD_UTILS',
);
