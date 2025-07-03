from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import africastalking

# Initialize Africa's Talking
africastalking.initialize('YOUR_AT_USERNAME', 'YOUR_AT_API_KEY')
sms = africastalking.SMS

def generate_outbreak_sms(disease, region, measures, ussd_code, authority="Ministry of Health Kenya"):
    measures_text = '\n- '.join(measures)
    return (
        f"\u26a0\ufe0f Disease Alert: {disease} outbreak in {region}.\n\n"
        f"To protect yourself and your family:\n- {measures_text}\n\n"
        f"For free medical help or to report symptoms, dial {ussd_code} or visit your nearest clinic.\n\n"
        f"Stay alert—{authority}."
    )

class SendBulkAlert(APIView):
    def post(self, request):
        message = request.data.get('message')
        recipients = request.data.get('recipients', [])
        # If message is not provided, try to generate it from outbreak data
        if not message:
            disease = request.data.get('disease')
            region = request.data.get('region')
            measures = request.data.get('measures')
            ussd_code = request.data.get('ussd_code')
            if not (disease and region and measures and ussd_code):
                return Response({'error': 'Either message or all of disease, region, measures, and ussd_code are required.'}, status=status.HTTP_400_BAD_REQUEST)
            message = generate_outbreak_sms(disease, region, measures, ussd_code)
        if not recipients:
            return Response({'error': 'Recipients are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            response = sms.send(message, recipients)
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendVaccineInfo(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        vaccine_name = request.data.get('vaccine_name')
        info = request.data.get('info')
        if not (phone and vaccine_name and info):
            return Response({'error': 'phone, vaccine_name, and info are required.'}, status=status.HTTP_400_BAD_REQUEST)
        message = f"\ud83d\udc89 {vaccine_name} Info:\n{info}\nReply 1 for appointment details."
        try:
            response = sms.send(message, [phone])
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendAppointment(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        child_name = request.data.get('child_name')
        date = request.data.get('date')
        time = request.data.get('time')
        facility = request.data.get('facility')
        if not (phone and child_name and date and time and facility):
            return Response({'error': 'phone, child_name, date, time, and facility are required.'}, status=status.HTTP_400_BAD_REQUEST)
        message = f"\ud83d\udcc5 {child_name}'s vaccine appointment: {date}, {time}\n\ud83d\udccd {facility}\nBring clinic card & water."
        try:
            response = sms.send(message, [phone])
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 