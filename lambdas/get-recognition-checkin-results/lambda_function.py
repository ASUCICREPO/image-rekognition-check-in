import base64
import requests
from custom_libraries import asu_celebs
import json
import boto3

def lambda_handler(event, context):

    event = event["body"]

    # *********************** PROPERTIES ************************************** #
    # dynamo table properties
    bucket_name = 'image-rekognition-checkin-image-store'
    # celebrity_rekognition_collection = 'celebrity_collection'
    doppelganger_collection = 'doppelganger-checkin-collection'
    rekognition_client = boto3.client('rekognition')

    ########## Text Recognition ##########

    # This function finds the text present in the input image
    # Input: Image in bytes
    # Output: Text in the image

    def text_recognition():
        response = rekognition_client.detect_text(Image={'Bytes': base64.b64decode(image)})
        alltext = response['TextDetections']
        allStrings = []
        for text in alltext:
            allStrings.append(text['DetectedText'])
        return allStrings

    ########## Object Recognition ##########

    # This function finds the objects present in the input image
    # Input: Image in bytes
    # Output: Top 5 objects in the image

    def object_labels():
        objects_ommit = ['Face', 'Person', 'People', 'Human']
        response = rekognition_client.detect_labels(Image={'Bytes': base64.b64decode(image)})
        labelTexts = [x['Name'] for x in response['Labels']]
        filteredLabels = [x for x in labelTexts if x not in objects_ommit]
        top5Labels = filteredLabels[:5]
        return top5Labels

    def getFaceDetails():
        # Checks the gender, age, emotions of the person in the image
        faceDetails = rekognition_client.detect_faces(Image={'Bytes': base64.b64decode(image)}, Attributes=['ALL'])['FaceDetails']
        if faceDetails:

            gender = faceDetails[0]['Gender']['Value']
            emotion = faceDetails[0]['Emotions'][0]['Type']
            age_low = faceDetails[0]['AgeRange']['Low']
            age_high = faceDetails[0]['AgeRange']['High']
            age_range = {'low': age_low, 'high': age_high}

            return gender, emotion, age_range
        else:
            return None, None, None

    def getASUEmployeeMatch():
        # Finds the best celebrity match
        response = rekognition_client.search_faces_by_image(
            CollectionId=doppelganger_collection,
            Image={'Bytes': base64.b64decode(image)},
            MaxFaces=5,
            FaceMatchThreshold=0
        )
        print(response)
        matchedFaces = response['FaceMatches']
        if matchedFaces:
            sortedMatches = sorted(matchedFaces, key=lambda x: x['Similarity'], reverse=True)
            bestMatch = sortedMatches[0]
            similarity = bestMatch['Similarity']
            asurite = bestMatch['Face']['ExternalImageId']

            if similarity > 90:
                return asurite, similarity
            else:
                return None, None
        else:
            return None, None

    # ########## CelebrityMatcher ##########

    # # This function finds best celebrity match for the input image
    # # Input: Image in bytes
    # # Output: Celebrity match
    
    # def checkCelebGender(faceDetails):
    #     s3key = faceDetails['Face']['ExternalImageId']
    #     celebrity_image_url = "https://celebrity-image-store.s3-us-west-1.amazonaws.com/" + s3key
    #     celelbrity_gender_response = rekognition_client.detect_faces(Image={"S3Object": {"Bucket": bucket_name, "Name": s3key}}, Attributes=['ALL'])
    #     celebrity_gender = celelbrity_gender_response['FaceDetails'][0]['Gender']['Value']
    #     return celebrity_gender
    
    # def matchCelebrity():
    #     userGender, emotion, age_range = getFaceDetails()
    #     print("User Gender: ", userGender, '\n', "Emotion: ", emotion, '\n', "AgeRange: ", age_range, '\n')
        
    #     # Finds top 5 best celebrity matches
    #     response = rekognition_client.search_faces_by_image(
    #         CollectionId=celebrity_rekognition_collection,
    #         Image={'Bytes': base64.b64decode(image)},
    #         MaxFaces=5,
    #         FaceMatchThreshold=0
    #     )
    #     matchedFaces = response['FaceMatches']
    #     if matchedFaces:
    #         bestMatch = None
    #         sortedMatches = sorted(matchedFaces, key=lambda x: x['Similarity'], reverse=True)
            
    #         for match in sortedMatches:
    #             celebrity_gender = checkCelebGender(match)
    #             if celebrity_gender == userGender:
    #                 bestMatch = match
    #                 break
                
    #         # If celebrity gender and the gender of the person in the input is the same, only then return some value otherwise return None
    #         if bestMatch is None:
    #             print("No faces returned match user gender")
    #             return None, None, None, None, None, None, None
                
            
    #         s3key = bestMatch['Face']['ExternalImageId']
    #         celebrity_name = ' '.join(s3key.split('.')[0].split('_'))
    #         confidence = bestMatch['Face']['Confidence']
    #         similarity = bestMatch['Similarity']
    #         celebrity_image_url = "https://celebrity-image-store.s3-us-west-1.amazonaws.com/" + s3key
            
    #         print('MATCHED CELEB FACE: ', bestMatch)
    #         print("CELEB IMAGE: ", celebrity_image_url, '\n', "CELEB NAME: ", celebrity_name)
            
    #         return celebrity_image_url, celebrity_name, confidence, similarity, emotion, age_range, userGender

    #     else:
    #         print('No faces matched')
    #         return None, None, None, None, None, None, None

    def getASUEmplyeeInfo(asurite):
        if asurite is None:
            return None
        info = asu_celebs.find_asu_vip(asurite)
        
        if(info is None):
            print("Calling with ID: ", asurite)
            url = 'https://asudir-solr.asu.edu/asudir/directory/select?q=*:*&fq=asuriteId:{}&wt=json'
            info = (requests.get(url.format(asurite)))
            info = info.json()

        return info

    ########## Main function ##########

    # This function is the main() function for this lambda
    # Input: Image in bytes
    # Output: Returns information to the dashboard

    # Checks if any images are present in the input image
    # input request payload properties
    event = json.loads(event)
    image = event["image"]
    match_options = event["options"]

    if match_options:
        result = {
            'asu_info': {},
            'confidence': None,
            'similarity': None,
            'emotion': None,
            'age_estimate': None,
            'labels': None,
            'gender': None,
            'text': None,
            'celebrity_match': {}
        }
        if 'celebrity_match' in match_options:
            # celebrity_image, celebrity_name, confidence, similarity, emotion, age_range, gender = matchCelebrity()
            # result['celebrity_match'] = {'image': celebrity_image, 'name': celebrity_name}
            # result['emotion'] = emotion
            # result['similarity'] = similarity
            # result['confidence'] = confidence
            # result['age_estimate'] = age_range
            # result['gender'] = gender

            asurite, similarity = getASUEmployeeMatch()
            if asurite:
                result['asu_info'] = getASUEmplyeeInfo(asurite)
                result["similarity"] = similarity

        # if 'image_text' in match_options:
        #     result['text'] = text_recognition()

        # if 'object_labels' in match_options:
        #     result['labels'] = object_labels()
        print(result)
        return result
    else:
        return {'info': None, 'similarity': None, 'confidence': None}
