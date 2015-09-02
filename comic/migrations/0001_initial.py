# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ComicCollection',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=b'Collection with No Name', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='ComicImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=b'Image with No Name', max_length=100)),
                ('image', models.ImageField(upload_to=b'images')),
                ('is_cover', models.BooleanField(default=False)),
                ('collection', models.ForeignKey(related_name='cimages', to='comic.ComicCollection')),
            ],
        ),
    ]
