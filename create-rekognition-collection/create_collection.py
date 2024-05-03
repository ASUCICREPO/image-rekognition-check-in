import boto3

def create_collection(collection_id):
    session = boto3.Session()
    client = session.client('rekognition')

    # Create a collection
    print('Creating collection:' + collection_id)
    response = client.create_collection(CollectionId=collection_id)
    print('Collection ARN: ' + response['CollectionArn'])
    print('Status code: ' + str(response['StatusCode']))
    print('Done...')

def main():
    collection_id = "doppelganger_collection"
    create_collection(collection_id)

if __name__ == "__main__":
    main()