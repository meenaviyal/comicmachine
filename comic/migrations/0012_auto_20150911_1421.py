# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0011_auto_20150911_0940'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comicstrip',
            name='image',
            field=models.ImageField(upload_to=b'strips'),
        ),
    ]
