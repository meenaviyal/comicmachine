from django.shortcuts import render, redirect, render_to_response
from django.core.context_processors import csrf
from django.views.decorators.csrf import csrf_exempt
from models import ComicImage, ComicCollection, ComicStrip, MoodTag, LangTag
import json
from django.http import HttpResponse
import base64
from django.core.files.base import ContentFile
from django.core.paginator import Paginator
import time
from django.template import RequestContext


def search_library(search_in, tags='all', page=1):
    print '#########'
    print search_in, tags, page
    images = ''
    if search_in == 'all' and tags == 'all':
        coll = ComicCollection.objects.all()[0]
        images = ComicImage.objects.filter(collection=coll).order_by('id')
    elif search_in == 'all' and tags != 'all':
        coll = ComicCollection.objects.all()[0]
        images = ComicImage.objects.filter(
            collection=coll,
            mood_tags__slug__in=tags).order_by('id')
    elif search_in != 'all' and tags == 'all':
        coll = ComicCollection.objects.get(id=search_in)
        images = ComicImage.objects.filter(
            collection=coll).order_by('id')
    else:
        coll = ComicCollection.objects.get(id=search_in)
        images = ComicImage.objects.filter(
            collection=coll, mood_tags__slug__in=tags).order_by('id')
    num_per_page = 12 if images.count() >= 12 else images.count()
    image_pages = Paginator(images, num_per_page)
    current_page = image_pages.page(page)
    images_list = []
    for o in current_page.object_list:
        images_list.append(o.image.url)
    return_dict = {'images': images_list,
                   'total_pages': image_pages.num_pages,
                   'current_page': page}

    print return_dict
    return return_dict


def comicgen(request):
    # mood_tags = MoodTag.objects.all()
    collections = ComicCollection.objects.all()
    context_dict = {'collections': collections}

    context = RequestContext(request)
    context.update(csrf(request))

    response = render_to_response(
        'comic/comicgen.html',
        context_dict, context)

    coll = request.COOKIES.get('selected_collection')
    if not coll:
        response.set_cookie('selected_collection', 'all')
    
    return response

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
            recieved_data['search_in'], 'all', recieved_data['page'])
        return HttpResponse(json.dumps(return_dict))


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