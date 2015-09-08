from django.contrib import admin
from models import ComicCollection, ComicImage, ComicStrip

# Register your models here.
admin.site.register(ComicCollection)
admin.site.register(ComicImage)
admin.site.register(ComicStrip)
