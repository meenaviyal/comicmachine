# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('comic', '0004_auto_20150907_2345'),
    ]

    operations = [
        migrations.RenameField(
            model_name='comicimage',
            old_name='tags',
            new_name='mood_tags',
        ),
    ]
