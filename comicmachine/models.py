from django.db import models

# Create your models here.


class ComicCollection(models.Model):
    name = models.CharField(max_length=100, default='Collection with No Name')

    def __str__(self):              # __unicode__ on Python 2
        return self.name


class ComicImage(models.Model):

    collection = models.ForeignKey(ComicCollection, related_name='cimages')
    name = models.CharField(max_length=100, default='Image with No Name')
    image = models.ImageField(upload_to="images")
    is_cover = models.BooleanField(default=False)

    def __str__(self):              # __unicode__ on Python 2
        return self.name
