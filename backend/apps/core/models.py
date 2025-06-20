from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    """
    Модель задачи с полями: заголовок, описание, статус, дата создания
    """
    STATUS_CHOICES = [
        ('pending', 'Не выполнено'),
        ('completed', 'Выполнено'),
    ]
    
    title = models.CharField(
        max_length=255, 
        verbose_name="Заголовок"
    )
    description = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Описание"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Статус"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Дата создания"
    )
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name="Дата обновления"
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='tasks',
        verbose_name="Пользователь"
    )

    class Meta:
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    @property
    def is_completed(self):
        """Проверка, выполнена ли задача"""
        return self.status == 'completed'
