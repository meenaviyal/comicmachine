# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('comic', '0007_auto_20150911_0934'),
    ]

    operations = [
        migrations.CreateModel(
            name='LangTag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=100, verbose_name='Name')),
                ('slug', models.SlugField(unique=True, max_length=100, verbose_name='Slug')),
            ],
            options={
                'verbose_name': 'Lang Tag',
                'verbose_name_plural': 'Lang Tags',
            },
        ),
        migrations.CreateModel(
            name='LangTaggedItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('object_id', models.IntegerField(verbose_name='Object id', db_index=True)),
                ('content_type', models.ForeignKey(related_name='comic_langtaggeditem_tagged_items', verbose_name='Content type', to='contenttypes.ContentType')),
                ('tag', models.ForeignKey(related_name='comic_langtaggeditem_items', to='comic.LangTag')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='comicimage',
            name='lang_tags',
            field=taggit.managers.TaggableManager(to='comic.LangTag', through='comic.LangTaggedItem', help_text='A comma-separated list of tags.', verbose_name='Tags'),
        ),
    ]
