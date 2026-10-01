"""Build index.html from src/.

    python3 build.py            # writes index.html using CDN copies of three.js and the muxers
    python3 build.py --debug    # keeps the window.__tf debug hooks
"""
import re, sys

THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
MP4 = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.2/build/mp4-muxer.js'
WEBM = 'https://cdn.jsdelivr.net/npm/webm-muxer@5.1.4/build/webm-muxer.js'
LOADERS = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/'

page = open('src/index.html').read()
css = open('src/style.css').read()
js = '\n'.join(open('src/' + f).read() for f in ('layers.js', 'gif.js', 'app.js'))
if '--debug' not in sys.argv:
    js = re.sub(r'/\*DEBUG\*/.*\n', '', js)

out = (page.replace('/*CSS*/', css).replace('/*JS*/', js)
       .replace('THREE_SRC', THREE).replace('MUX_MP4_SRC', MP4).replace('MUX_WEBM_SRC', WEBM)
       .replace('LOADER_GLTF', LOADERS + 'GLTFLoader.js').replace('LOADER_OBJ', LOADERS + 'OBJLoader.js')
       .replace('LOADER_STL', LOADERS + 'STLLoader.js'))
open('index.html', 'w').write(out)
print('index.html', len(out) // 1024, 'KB')
