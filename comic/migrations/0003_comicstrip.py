# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0002_auto_20150903_1455'),
    ]

    operations = [
        migrations.CreateModel(
            name='ComicStrip',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=b'Comic with No Name', max_length=100)),
                ('image', models.ImageField(upload_to=b'images/comicstrips/')),
            ],
        ),
    ]
