from django.shortcuts import render
from django.core.context_processors import csrf
from models import ComicImage, ComicCollection, ComicStrip, MoodTag, LangTag
import json
from django.http import HttpResponse
import base64
from django.core.files.base import ContentFile
from django.core.paginator import Paginator
import time


def search_library(search_in, tags, page):
    if search_in == 'all' and tags == 'all':
        images = ComicImage.objects.all()
        image_pages = Paginator(images, 4)
        current_page = image_pages.page(page)
        images_list = []
        for o in current_page.object_list:
            images_list.append(o.image.url)
        return_dict = {'images': images_list,
                       'total_pages': image_pages.num_pages,
                       'current_page': page}
        return return_dict
    elif search_in == 'all':
        images = ComicImage.objects.filter(mood_tags__slug__in=tags).distinct()
        return images
    else:
        coll = ComicCollection.objects.get(name=search_in)
        images = ""
        if tags == 'all':
            images = ComicImage.objects.filter(collection=coll)
        else:
            images = ComicImage.objects.filter(
                collection=coll, mood_tags__slug__in=tags).distinct()
        return images


def comicgen(request):
    mood_tags = MoodTag.objects.all()
    context = {'mood_tags': mood_tags}
    context.update(csrf(request))
    return render(request, 'comic/comicgen.html', context)


def library(request):
    if request.is_ajax():
        recieved_data = json.loads(request.body)

        return_dict = search_library(
            recieved_data['search_in'], recieved_data['tags'], recieved_data['page'])
        return HttpResponse(json.dumps(return_dict))


def tags(request):
    if request.is_ajax() and request.method == 'GET':

        tags = Tag.objects.all()
        tags_list = []
        for t in tags:
            tags_list.append({'tag_name': t.name, 'tag_slug': t.slug})

        return HttpResponse(json.dumps(tags_list))


def strip(request):
    if request.is_ajax() and request.method == 'POST':
        recieved_data = json.loads(request.body)
        imgdata = recieved_data['img_URI'].split(",", 1)
        imgdata = base64.b64decode(imgdata[1])
        new_strip = ComicStrip()
        filename = time.strftime("%Y%m%d%H%M%S")
        new_strip.image = ContentFile(imgdata, '{}.png'.format(filename))
        new_strip.save()
        return HttpResponse(json.dumps({'message': 'done'}))
