# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('comic', '0005_auto_20150911_0914'),
    ]

    operations = [
        migrations.CreateModel(
            name='MoodTag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=100, verbose_name='Name')),
                ('slug', models.SlugField(unique=True, max_length=100, verbose_name='Slug')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='MoodTaggedItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('object_id', models.IntegerField(verbose_name='Object id', db_index=True)),
                ('content_type', models.ForeignKey(related_name='comic_moodtaggeditem_tagged_items', verbose_name='Content type', to='contenttypes.ContentType')),
                ('tag', models.ForeignKey(related_name='comic_moodtaggeditem_items', to='comic.MoodTag')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='comicimage',
            name='mood_tags',
            field=taggit.managers.TaggableManager(to='comic.MoodTag', through='comic.MoodTaggedItem', help_text='A comma-separated list of tags.', verbose_name='Tags'),
        ),
    ]
