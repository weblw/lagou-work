<template>
  <div>
    <form class="card comment-form">
      <div class="card-block">
        <textarea v-model="comment" class="form-control" placeholder="Write a comment..." rows="3"></textarea>
      </div>
      <div class="card-footer">
        <img :src="$store.state.user.image" class="comment-author-img" />
        <button class="btn btn-sm btn-primary" @click.prevent="submitComment">
          Post Comment
        </button>
      </div>
    </form>

    <div class="card" v-for="comment in comments" :key="comment.id">
      <div class="card-block">
        <p class="card-text">{{ comment.body }}</p>
      </div>
      <div class="card-footer">
        <nuxt-link :to="{
          name: 'profile',
          params: {
            username: comment.author.username
          }
        }" class="comment-author">
          <img :src="comment.author.image" class="comment-author-img" />
        </nuxt-link>
        &nbsp;
        <nuxt-link :to="{
          name: 'profile',
          params: {
            username: comment.author.username
          }
        }" class="comment-author">
          {{ comment.author.username }}
        </nuxt-link>
        <span class="date-posted">{{ comment.createAt | date('MMM DD, YYYY') }}</span>
        <span class="mod-options">
          <i class="ion-edit"></i>
          <i class="ion-trash-a"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { getComments, postComments } from '@/api/article.js'

export default {
  name: 'articleComments',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      comment: ''
    }
  },
  async mounted() {
    await this.getComments()
  },
  methods: {
    async getComments() {
      const { data } = await getComments(this.article.slug)
      this.comments = data.comments
    },
    async submitComment() {
      await postComments(this.article.slug, {
        comment: {
          body: this.comment
        }
      })
      await this.getComments()
      this.comment = ''
    }
  }
}
</script>