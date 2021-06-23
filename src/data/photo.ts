import { DynamoDB } from "aws-sdk"
import { ulid } from "ulid"

import { Item } from "./base"
import { getClient } from "./client"

export class Photo extends Item {
    username: string
    url: string
    photoId: string
    likesCount: number
    commentCount: number

    constructor(username: string, url?: string, photoId: string = ulid(), likesCount?: number, commentCount?: number) {
        super()
        this.username = username
        this.url = url
        this.photoId = photoId
        this.likesCount = likesCount || 0
        this.commentCount = commentCount || 0
    }

    static fromItem(item?: DynamoDB.AttributeMap): Photo {
        if (!item) throw new Error("No item!")
        return new Photo(
            item.username.S,
            item.url.S,
            item.photoId.S,
            Number(item.likesCount.N),
            Number(item.commentCount.N)
        )
    }

    get pk(): string {
        return `UP#${this.username}`
    }

    get sk(): string {
        return `PHOTO#${this.photoId}`
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            username: { S: this.username },
            url: { S: this.url },
            photoId: { S: this.photoId },
            likesCount: { N: this.likesCount.toString() },
            commentCount: { N: this.commentCount.toString() }
        }
    }
}

export const createPhoto = async (photo: Photo): Promise<Photo> => {
    const client = getClient()
    try {
        await client
            .putItem({
                TableName: process.env.TABLE_NAME,
                Item: photo.toItem(),
                ConditionExpression: "attribute_not_exists(PK)"
            })
            .promise()
        return photo
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getPhoto = async (username: string, photoId: string): Promise<Photo> => {
    const client = getClient()
    const photo = new Photo(username, "", photoId)

    try {
        const resp = await client
            .getItem({
                TableName: process.env.TABLE_NAME,
                Key: photo.keys()
            })
            .promise()
        return Photo.fromItem(resp.Item)
    } catch (error) {
        console.log(error)
        throw error
    }
}
