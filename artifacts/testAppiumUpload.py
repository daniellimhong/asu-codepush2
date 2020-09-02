import boto3
import time
import httplib
import requests
import os

client = boto3.client('devicefarm',region_name='us-west-2')
projectArn='arn:aws:devicefarm:us-west-2:456214169279:project:cf869322-5ffa-4ed5-9fbc-17f638180d6d'

print "######## Creating Upload #################"
response = client.create_upload(
    projectArn='arn:aws:devicefarm:us-west-2:456214169279:project:cf869322-5ffa-4ed5-9fbc-17f638180d6d',
    name='appiumTestSuite',
    type='APPIUM_PYTHON_TEST_PACKAGE',
    contentType='application/octet-stream'
)

print response

print "######## Upload URL Response #############"

uploadUrl = response['upload']['url']
print uploadUrl

print "######### Uploading to S3 ################"

length = str(os.stat('../AppiumTestSuite/test_bundle.zip').st_size)
headers = {'content-type': 'application/octet-stream','Content-Length' : length}
responseUpload = requests.put(uploadUrl,
                headers = headers,
                data = open('../AppiumTestSuite/test_bundle.zip', 'rb')              
                 )
print responseUpload