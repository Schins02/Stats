# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-09-08 19:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rangerstats', '0003_auto_20160901_1134'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='bat',
            field=models.CharField(default='R', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='player',
            name='height',
            field=models.CharField(default='6\' 0"', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='player',
            name='throw',
            field=models.CharField(default='R', max_length=15),
            preserve_default=False,
        ),
    ]