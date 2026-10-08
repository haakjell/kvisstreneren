# Pixel difference between two screenshots, for compare.mjs: prints the largest difference,
# the number of differing pixels and their bounding box.
import sys
from PIL import Image, ImageChops
a=Image.open(sys.argv[1]).convert('RGB'); b=Image.open(sys.argv[2]).convert('RGB')
if a.size!=b.size: print('size %s vs %s'%(a.size,b.size)); sys.exit()
d=ImageChops.difference(a,b).convert('L')
h=d.histogram()
print('max %d pixels %d bbox %s'%(max(i for i,n in enumerate(h) if n), sum(h[1:]), d.getbbox()))
