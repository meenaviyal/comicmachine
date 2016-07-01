import os

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '(kn)n9#wace@5*k-dcm@hjf(ei6+b4vpe99&bpo^6u4=l2wts!'

DEBUG = True
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
STATIC_ROOT =  os.path.join(BASE_DIR, 'staticroot')
