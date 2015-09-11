# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0009_auto_20150911_0938'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='langtaggeditem',
            options={},
        ),
        migrations.AlterModelOptions(
            name='moodtaggeditem',
            options={},
        ),
    ]
