from django.contrib import admin
from models import ComicCollection, ComicImage, ComicStrip, LangTag, MoodTag

# Register your models here.
admin.site.register(ComicCollection)
admin.site.register(ComicImage)
admin.site.register(ComicStrip)
admin.site.register(MoodTag)
admin.site.register(LangTag)
