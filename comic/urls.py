from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^library/$', views.library, name='library'),
    url(r'^comicstrip/$', views.strip, name='comicstrip'),
    url(r'^create/$', views.comicgen, name='comicgen'),
    url(r'^about/$', views.about, name='comicgen'),
    url(r'^unsupported/$', views.unsupported, name='unsupported'),
    url(r'^$', views.home, name='home'),
]
