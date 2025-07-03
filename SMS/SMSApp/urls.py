from django.urls import path
from .views import SendBulkAlert, SendVaccineInfo, SendAppointment

urlpatterns = [
    path('send-bulk-alert/', SendBulkAlert.as_view(), name='send_bulk_alert'),
    path('send-vaccine-info/', SendVaccineInfo.as_view(), name='send_vaccine_info'),
    path('send-appointment/', SendAppointment.as_view(), name='send_appointment'),
] 