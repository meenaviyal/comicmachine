# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0010_auto_20150911_0939'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comicimage',
            name='lang_tags',
        ),
        migrations.AddField(
            model_name='comiccollection',
            name='lang_tags',
            field=taggit.managers.TaggableManager(to='comic.LangTag', through='comic.LangTaggedItem', help_text='A comma-separated list of tags.', verbose_name='Tags'),
        ),
    ]
