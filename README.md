# DynamoDB Instagram

*This project was built for a DynamoDB demo on [Marcia Villalba's YouTube channel](https://www.youtube.com/channel/UCSLIvjWJwLRQze9Pn4cectQ). For this demo, we saw how + why to use DynamoDB, then displayed some common DynamoDB patterns by building a simple Instagram clone.*

### Table of Contents

- [Usage](#usage)
- [Terms & Concepts](#terms-and-concepts)
- [DynamoDB patterns](#dynamodb-patterns)

You may also refer to the following artifacts to understand this project:

- [Entity chart](https://docs.google.com/spreadsheets/d/1IWVXyiJ0y4DF6ii-H6vKCF0qQUZr4akI59IaiL1ArIs/edit#gid=0?usp=sharing)
- [Access patterns chart](https://docs.google.com/spreadsheets/d/1IWVXyiJ0y4DF6ii-H6vKCF0qQUZr4akI59IaiL1ArIs/edit#gid=1488945379?usp=sharing)

## Usage

To deploy this project, run the following commands in your terminal:

```bash
git clone git@github.com:alexdebrie/dynamodb-instagram.git && cd dynamodb-instagram
npm i
sls deploy
```

You should see output indicating the service was deployed and your endpoints are live:

```bash
Service Information
service: dynamodb-instagram
stage: dev
region: us-east-1
stack: dynamodb-instagram-dev
resources: 69
api keys:
  None
endpoints:
  POST - https://*********.execute-api.us-east-1.amazonaws.com/dev/users
  GET - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}
  POST - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/photos
  GET - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/photos/{photoId}
  POST - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/photos/{photoId}/likes
  GET - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/photos/{photoId}/likes
  POST - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/photos/{photoId}/comments
  GET - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/photos/{photoId}/comments
  POST - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/followers
  GET - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/followers
  GET - https://*********.execute-api.us-east-1.amazonaws.com/dev/users/{username}/following
functions:
  createUser: dynamodb-instagram-dev-createUser
  getUser: dynamodb-instagram-dev-getUser
  createPhoto: dynamodb-instagram-dev-createPhoto
  ...
```

## Terms and Concepts

We are building an Instagram clone where users can post photos. Other users may like a photo or comment on a photo. Finally, a user may choose to 'follow' another user in order to see their recent activity.

Each entity is discussed further below. Clicking on the entity link will take you to the code definition for the entity.

- A [**User**](./src/data/user.ts) represents a person that has signed up for our application. They will be uniquely identified by a username.

- A [**Photo**](./src/data/photo.ts) represents an image uploaded by a particular User. You can browse all Photos for a particular User in reverse-chronological order. Each Photo can be Liked or Commented on (see below).

- A [**Like**](./src/data/like.ts) represents a specific User 'liking' a specific Photo. A specific Photo may only be liked once by a specific User. When showing a Photo, we will show the total number of Likes for that Photo.

- A [**Comment**](./src/data/comment.ts) represents a User commenting on a particular Photo. There is no limit to the number of Comments on a Photo by a given User. When showing a Photo, we will show the total number of Comments for that Photo.

- A [**Follow**](./src/data/follow.ts) represents one User choosing to follow another User. By following another User, you will receive updates from that User in your timeline (not implemented in this demo). A Follow is a one-way relationship -- a User can follow another User without the second User following in return. For a particular User, we want to show the number of other Users following them and the number of Users they're following, as well as the ability to show the lists of Followers and Followees.

## DynamoDB patterns

Below are a few patterns demonstrated in this repository that can be useful for using DynamoDB in your application:

- [Abstract base class for entities](./src/data/base.ts). It defines common methods that need to be implemented for each entity -- `PK` & `SK` values; `toItem()` method; etc.

- [`getClient()` function to return a DynamoDB client](./src/data/client.ts). This returns a singleton DynamoDB client to enable re-use of the underlying HTTP connection across Lambda invocations. Also, it includes common client parameters like timeouts to ensure proper configuration.

- [Using ULIDs as unique, sortable identifiers](./src/data/photo.ts). A [ULID](https://github.com/ulid/spec) provides the uniqueness of a UUID but is prefixed with the creation-time timestamp. This allows for lexicographic sorting of the IDs based on creation time.

- [ConditionExpressions when creating a User](./src/data/user.ts#51). This ensures uniquness of usernames for all Users.

- [Query operation to fetch all Comments for a Photo](./src/data/comment.ts#87). The Query operation allows us to fetch an array of items when we only know the partition key (the PhotoId). 

- [Using a DynamoDB Transaction to ensure uniquness + track reference counts](./src/data/like.ts#54). When creating a Like, we will add the Like with a ConditionExpression to ensure this User hasn't already liked the given Photo. Additionally, we will increment the `likesCount` attribute on the Photo.

- [Using multiple requests in many-to-many relationships](./src/data/follows.ts#106). When retrieving the followers for a particular User, we make two requests. First, we make a Query operation to find all the Follow records for a particular User. Second, we make a BatchGetItem operation to hydrate all the User entities for each follower.
