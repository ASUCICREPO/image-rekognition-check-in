def find_asu_vip(asurite):
    if(asurite == 'anjalisrivastava'):
        info = {'response': {'docs': [
            {'asuriteId': 'anjalisrivastava',
             'firstName': 'Anjali',
             'middleName': '',
             'lastName': 'Srivastava',
             'displayName': 'Anjali Srivastava',
             'workingTitle': 'Cloud Developer Associate',
             'primaryDepartment': 'ASU CIC',
             'primaryEmplClass': '',
             'locations': 'United States'
             }
        ]}}
    
    elif(asurite == 'ArunArunachalam'):
        info = {'response': {'docs': [
            {'asuriteId': 'ArunArunachalam',
             'firstName': 'Arun',
             'middleName': '',
             'lastName': 'Arunachalam',
             'displayName': 'Arun Arunachalam',
             'workingTitle': 'Senior Solutions Architect, AWS',
             'primaryDepartment': 'ASU CIC',
             'primaryEmplClass': '',
             'locations': 'United States'
             }
        ]}}
    elif(asurite == 'ColleenSchwab'):
        info = {'response': {'docs': [
            {'asuriteId': 'ColleenSchwab',
             'firstName': 'Colleen',
             'middleName': '',
             'lastName': 'Schwab',
             'displayName': 'Colleen Schwab',
             'workingTitle': 'Digital Innovation Lead, AWS',
             'primaryDepartment': 'ASU CIC',
             'primaryEmplClass': '',
             'locations': 'United States'
             }
        ]}}
    elif(asurite == 'JohnRome'):
        info = {'response': {'docs': [
            {'asuriteId': 'JohnRome',
             'firstName': 'John',
             'middleName': '',
             'lastName': 'Rome',
             'displayName': 'John Rome',
             'workingTitle': 'Deputy CIO & Strategic Partnerships, ASU',
             'primaryDepartment': 'ASU CIC',
             'primaryEmplClass': '',
             'locations': 'United States'
             }
        ]}}
    elif(asurite == 'RyanHendrix'):
        info = {'response': {'docs': [
            {'asuriteId': 'RyanHendrix',
             'firstName': 'Ryan',
             'middleName': '',
             'lastName': 'Hendrix',
             'displayName': 'Ryan Hendrix',
             'workingTitle': 'General Manager, ASU',
             'primaryDepartment': 'ASU CIC',
             'primaryEmplClass': '',
             'locations': 'United States'
             }
        ]}}
    elif(asurite == 'TomOrr'):
        info = {'response': {'docs': [
            {'asuriteId': 'TomOrr',
             'firstName': 'Tom',
             'middleName': '',
             'lastName': 'Orr',
             'displayName': 'Tom Orr',
             'workingTitle': 'Senior Program Manager, AWS',
             'primaryDepartment': 'ASU CIC',
             'primaryEmplClass': '',
             'locations': 'United States'
             }
        ]}}
    else:
        info = None
    return info
