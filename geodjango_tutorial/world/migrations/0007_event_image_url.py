# Generated by Django 5.1.4 on 2024-12-23 12:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('world', '0006_event'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='image_url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
