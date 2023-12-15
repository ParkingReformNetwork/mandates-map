import pandas as pd
import requests
import supabase
import re

supabase_url = 'https://oecrkeanazdxowjcpjqr.supabase.co'
supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lY3JrZWFuYXpkeG93amNwanFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDE5NTkwMiwiZXhwIjoxOTk5NzcxOTAyfQ.vbfQO5YBPkpoQHJzGJ0jfLOVN2RvEzh9BIYLnZ3to7A'
supabase_client = supabase.create_client(supabase_url, supabase_service_key)

def download_and_upload (attachment_url, citation_id, count):
    response = requests.get(attachment_url)
    if response.status_code == 200:
        attachment_content = response.content
        destination_path = f'Uploads/{citation_id}_{count}.png'

        supabase_client.storage.from_('Citation_Attachments').upload(
            file = attachment_content,
            path = destination_path,
            file_options = {'content-type': 'image/png'}
        )
    else:
        print ("Failed to download :/")

citation_table_url = 'https://area120tables.googleapis.com/link/aUJhBkwwY9j1NpD-Enh4WU/export?key=aasll5u2e8Xf-jxNNGlk3vbnOYcDsJn-JbgeI3z6IkPk8z5CxpWOLEp5EXd8iMF_bc'
df = pd.read_csv(citation_table_url)

for idx, row in df.iterrows():
    try:
        attachments = row['Attachments']
        citation_id = row['CitationID']

        #have to separate urls because all clumped together
        if isinstance(attachments, str) and re.search(r'https://\S+', attachments):
            image_urls = re.findall(r'https://\S+', attachments)

        for i, url in enumerate(image_urls):
            count = i + 1  #to name multiple files with same citation id. they all should start at citationID_1
           # download_and_upload(url, citation_id, count)
    except Exception as e:
        print(f"Error occurred at row {idx}: {e}")