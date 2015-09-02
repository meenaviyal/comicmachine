from django.shortcuts import render
from models import ComicImage, ComicCollection


def comicgen(request):
    coll = ComicCollection.objects.get(name='Orion\'s Collection')
    coll1 = ComicImage.objects.filter(collection=coll)
    context = {'coll1': coll1}
    return render(request, 'comic/comicgen.html', context)
