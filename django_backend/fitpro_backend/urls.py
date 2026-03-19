from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/',      include('users.urls_auth')),
    path('api/v1/users/',     include('users.urls')),
    path('api/v1/exercises/', include('exercises.urls')),
    path('api/v1/routines/',  include('routines.urls')),
    path('api/v1/workouts/',  include('workouts.urls')),
    path('api/v1/calendar/',  include('calendar_app.urls')),
    path('api/v1/chat/',      include('chat.urls')),
    path('api/v1/social/',    include('social.urls')),
    path('api/v1/payments/',  include('payments.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
