from django.db import models

class Post(models.Model):
    author     = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='posts')
    text       = models.TextField()
    image_url  = models.URLField(blank=True)
    routine    = models.ForeignKey('routines.Routine', null=True, blank=True, on_delete=models.SET_NULL)
    likes      = models.ManyToManyField('users.User', related_name='liked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'social'
        ordering  = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'

    def __str__(self):
        return f'{self.author.name}: {self.text[:50]}'

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()


class Comment(models.Model):
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author     = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='comments')
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'social'
        ordering  = ['created_at']
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'

    def __str__(self):
        return f'{self.author.name} en post {self.post_id}: {self.text[:40]}'
