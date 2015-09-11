# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0006_auto_20150911_0928'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='moodtag',
            options={'verbose_name': 'Mood Tag', 'verbose_name_plural': 'Mood Tags'},
        ),
    ]
