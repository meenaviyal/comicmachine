from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.comicgen, name='comicgen'),
    url(r'^library/$', views.library, name='library'),
]
