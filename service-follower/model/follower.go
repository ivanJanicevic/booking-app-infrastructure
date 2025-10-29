package model

type Follower struct {
	FollowedUserID int `json:"followedUserId"`
	FollowerID     int `json:"followerId"`
}