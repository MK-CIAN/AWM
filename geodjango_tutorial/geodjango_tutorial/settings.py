"""
Django settings for geodjango_tutorial project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os
import socket
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# DOCKER CONFIG VARIABLES
POSTGIS_PORT = os.getenv('POSTGIS_PORT')
DEPLOY_SECURE = os.getenv('DEPLOY_SECURE')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'world.apps.WorldConfig'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'geodjango_tutorial.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'geodjango_tutorial.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'gis',
        'HOST': 'postgis',
        'USER': 'docker',
        'PASSWORD': 'docker',
        'PORT': '5432'
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

STATIC_URL = '/static/'


if socket.gethostname() == 'Cians-Air':
    DATABASES["default"]["HOST"] = "localhost"
    DATABASES["default"]["PORT"] = POSTGIS_PORT
else:
    DATABASES["default"]["HOST"] = "postgis"
    DATABASES["default"]["PORT"] = 5432


if DEPLOY_SECURE:

    DEBUG = False

    TEMPLATES[0]["OPTIONS"]["debug"] = False

    # Allow only specified hosts in production
    ALLOWED_HOSTS = ['*.c21755919awm24.xyz', 'c21755919awm24.xyz', 'localhost', '127.0.0.1']
    

    CSRF_COOKIE_SECURE = True

    SESSION_COOKIE_SECURE = True
    # Specify trusted origin for CSRF checks
    CSRF_TRUSTED_ORIGINS = ['https://c21755919awm24.xyz']
else:

    DEBUG = True

    TEMPLATES[0]["OPTIONS"]["debug"] = True

    # Allow all hosts in development
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

    CSRF_COOKIE_SECURE = False

    SESSION_COOKIE_SECURE = False

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
