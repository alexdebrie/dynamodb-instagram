import { DynamoDB } from "aws-sdk"
import { ulid } from "ulid"

import { Item } from "./base"
import { getClient } from "./client"
import { Photo } from "./photo"
import { executeTransactWrite } from "./utils"

export class Like extends Item {
    likingUsername: string
    photoId: string
    likeId: string

    constructor(likingUsername: string, photoId: string, likeId: string = ulid()) {
        super()
        this.likingUsername = likingUsername
        this.photoId = photoId
        this.likeId = likeId
    }

    static fromItem(item?: DynamoDB.AttributeMap): Like {
        if (!item) throw new Error("No item!")
        return new Like(item.likingUsername.S, item.photoId.S, item.likeId.S)
    }

    get pk(): string {
        return `PL#${this.photoId}`
    }

    get sk(): string {
        return `LIKE#${this.likingUsername}`
    }

    get gsi1pk(): string {
        return this.pk
    }

    get gsi1sk(): string {
        return `LIKE#${this.likeId}`
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            GSI1PK: { S: this.gsi1pk },
            GSI1SK: { S: this.gsi1sk },
            likingUsername: { S: this.likingUsername },
            photoId: { S: this.photoId },
            likeId: { S: this.likeId }
        }
    }
}

export const likePhoto = async (photo: Photo, likingUsername: string): Promise<Like> => {
    const client = getClient()
    const like = new Like(likingUsername, photo.photoId)

    try {
        await executeTransactWrite({
            client,
            params: {
                TransactItems: [
                    {
                        Put: {
                            TableName: process.env.TABLE_NAME,
                            Item: like.toItem(),
                            ConditionExpression: "attribute_not_exists(PK)"
                        }
                    },
                    {
                        Update: {
                            TableName: process.env.TABLE_NAME,
                            Key: photo.keys(),
                            ConditionExpression: "attribute_exists(PK)",
                            UpdateExpression: "SET #likesCount = #likesCount + :inc",
                            ExpressionAttributeNames: {
                                "#likesCount": "likesCount"
                            },
                            ExpressionAttributeValues: {
                                ":inc": { N: "1" }
                            }
                        }
                    }
                ]
            }
        })
        return like
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const listLikesForPhoto = async (photoId: string): Promise<Like[]> => {
    const client = getClient()
    const like = new Like("", photoId)

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                IndexName: "GSI1",
                KeyConditionExpression: "GSI1PK = :gsi1pk",
                ExpressionAttributeValues: {
                    ":gsi1pk": { S: like.gsi1pk }
                },
                ScanIndexForward: false
            })
            .promise()
        return resp.Items.map((item) => Like.fromItem(item))
    } catch (error) {
        console.log(error)
        throw error
    }
}
