from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^library/$', views.library, name='library'),
    url(r'^tags/$', views.tags, name='tags'),
    url(r'^comicstrip/$', views.strip, name='comicstrip'),
    url(r'^$', views.comicgen, name='comicgen'),

]
