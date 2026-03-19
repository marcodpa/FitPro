import os

MYSQL_APPS = {
    'users', 'exercises', 'routines', 'workouts',
    'calendar_app', 'chat', 'social', 'payments',
}

# FITPRO_OFFLINE=true => todo usa SQLite (sin MySQL)
OFFLINE_MODE = os.environ.get('FITPRO_OFFLINE', 'true').lower() == 'true'

class FitProDBRouter:
    def _get_db(self, app_label):
        if OFFLINE_MODE or app_label not in MYSQL_APPS:
            return 'default'
        return 'mysql'

    def db_for_read(self, model, **hints):
        return self._get_db(model._meta.app_label)

    def db_for_write(self, model, **hints):
        return self._get_db(model._meta.app_label)

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if OFFLINE_MODE:
            return db == 'default'
        if db == 'mysql':
            return app_label in MYSQL_APPS
        if db == 'default':
            return app_label not in MYSQL_APPS
        return None
