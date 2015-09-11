# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0008_auto_20150911_0937'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='langtaggeditem',
            options={'verbose_name': 'Lang Tag', 'verbose_name_plural': 'Lang Tags'},
        ),
        migrations.AlterModelOptions(
            name='moodtaggeditem',
            options={'verbose_name': 'Mood Tag', 'verbose_name_plural': 'Mood Tags'},
        ),
    ]
