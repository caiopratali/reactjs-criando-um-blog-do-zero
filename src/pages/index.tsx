import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [ posts, setPosts ] = useState(postsPagination.results);

  async function handleLoadMore() {
    
    const morePosts = fetch(postsPagination.next_page)
    .then(content => content.json())
    .then(response => response.results);

    const postList = await morePosts;

    const results = postList.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    let newList = results.concat(posts)

    setPosts(newList)

    console.log(newList)

  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src="/images/logo.svg" alt="logo" />
      </div>
      <div>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <h4>{post.data.subtitle}</h4>
              <div>
                <div>
                  <FiCalendar />
                  <p>{format(
                    new Date(post.first_publication_date),
                    "dd MMM yyyy",
                    {
                      locale: ptBR,
                    }
                  )}</p>
                </div>
                <div>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {
        postsPagination.next_page !== null 
        ? <button type="button" onClick={() => handleLoadMore()}>Carregar mais posts</button>
        : ''
      }
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 2
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination: PostPagination = {
    results,
    next_page: postsResponse.next_page
  }

  return {
    props: {
      postsPagination
    }
  }
};