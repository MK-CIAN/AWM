# Generated by Django 5.1.4 on 2024-12-19 14:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('world', '0005_alter_audiotourpoints_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('date', models.DateTimeField()),
                ('category', models.CharField(blank=True, max_length=100, null=True)),
                ('external_link', models.URLField()),
                ('api_source', models.CharField(blank=True, max_length=50, null=True)),
                ('event_id', models.CharField(max_length=255, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]