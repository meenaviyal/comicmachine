from django.shortcuts import render
from django.core.context_processors import csrf
from models import ComicImage, ComicCollection, ComicStrip
import json
from django.http import HttpResponse
from taggit.models import Tag
import base64
from django.core.files.base import ContentFile
import time


def search_library(search_in, tags):
    if search_in == 'all' and tags == 'all':
        images = ComicImage.objects.all()
        return images
    elif search_in == 'all':
        images = ComicImage.objects.filter(tags__slug__in=tags).distinct()
        return images
    else:
        coll = ComicCollection.objects.get(name =search_in)
        images = ""
        if tags == 'all':
            images = ComicImage.objects.filter(collection=coll)
        else:
            images = ComicImage.objects.filter(collection=coll, tags__slug__in=tags).distinct()
        return images


def comicgen(request):
    tags = Tag.objects.all()
    context = {'tags': tags}
    context.update(csrf(request))
    return render(request, 'comic/comicgen.html', context)


def library(request):
    if request.is_ajax():
        recieved_data = json.loads(request.body)

        images = search_library(recieved_data['search_in'], recieved_data['tags'])
        images_list = []
        for i in images:
            images_list.append(i.image.url)

        return HttpResponse(json.dumps(images_list))


def tags(request):
    if request.is_ajax() and request.method == 'GET':

        tags = Tag.objects.all()
        tags_list = []
        for t in tags:
            tags_list.append({'tag_name': t.name, 'tag_slug': t.slug})

        return HttpResponse(json.dumps(tags_list))


def comicstrip(request):
    if request.is_ajax() and request.method == 'POST':
        recieved_data = json.loads(request.body)
        imgdata = base64.b64decode(recieved_data['img_URI'])
        new_strip = comicstrip()
        filename = time.strftime("%Y%m%d%H%M%S")
        new_strip.image = ContentFile(imgdata, '{}.png'.format(filename))
        new_strip.save()
        return HttpResponse(json.dumps({'message': 'done'}))
