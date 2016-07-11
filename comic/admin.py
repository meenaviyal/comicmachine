from django.contrib import admin
from models import ComicCollection, ComicImage, ComicStrip, LangTag, MoodTag


class ComicStripAdmin(admin.ModelAdmin):
    list_display = ('name', 'image_tag', 'featured')

# Register your models here.
admin.site.register(ComicCollection)
admin.site.register(ComicImage)
admin.site.register(ComicStrip, ComicStripAdmin)
admin.site.register(MoodTag)
admin.site.register(LangTag)
