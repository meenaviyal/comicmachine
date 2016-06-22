from django.shortcuts import render, redirect
from django.core.context_processors import csrf
from django.views.decorators.csrf import csrf_exempt
from models import ComicImage, ComicCollection, ComicStrip, MoodTag, LangTag
import json
from django.http import HttpResponse
import base64
from django.core.files.base import ContentFile
from django.core.paginator import Paginator
import time


def search_library(search_in, tags, page):
    images = ''
    if search_in == 'all' and tags == 'all':
        images = ComicImage.objects.all()
    elif search_in == 'all' and tags != 'all':
        images = ComicImage.objects.filter(mood_tags__slug__in=tags).distinct()
    elif search_in != 'all' and tags == 'all':
        coll = ComicCollection.objects.get(id=search_in)
        images = ComicImage.objects.filter(
            collection=coll).distinct()
    else:
        coll = ComicCollection.objects.get(id=search_in)
        images = ComicImage.objects.filter(
            collection=coll, mood_tags__slug__in=tags).distinct()
    image_pages = Paginator(images, 6)
    current_page = image_pages.page(page)
    images_list = []
    for o in current_page.object_list:
        images_list.append(o.image.url)
    return_dict = {'images': images_list,
                   'total_pages': image_pages.num_pages,
                   'current_page': page}
    return return_dict


def comicgen(request):
    mood_tags = MoodTag.objects.all()
    collections = ComicCollection.objects.all()
    context = {'mood_tags': mood_tags, 'collections': collections}
    context.update(csrf(request))
    return render(request, 'comic/comicgen.html', context)

def collections(request):
    collections = ComicCollection.objects.all()
    context = {'collections': collections}
    context.update(csrf(request))
    return render(request, 'comic/collections.html', context)


@csrf_exempt
def library(request):
    if request.is_ajax():
        recieved_data = json.loads(request.body)

        return_dict = search_library(
            recieved_data['search_in'], recieved_data['tags'], recieved_data['page'])
        return HttpResponse(json.dumps(return_dict))


# def tags(request):
#     if request.is_ajax() and request.method == 'GET':

#         tags = Tag.objects.all()
#         tags_list = []
#         for t in tags:
#             tags_list.append({'tag_name': t.name, 'tag_slug': t.slug})

#         return HttpResponse(json.dumps(tags_list))



@csrf_exempt
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


def home(request):
    return redirect('/create')