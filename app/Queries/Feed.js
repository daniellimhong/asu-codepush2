import gql from "graphql-tag";
import { graphql } from "react-apollo";

export const GetEventsQuery = gql`
  query($page: Int, $roles: [String]) {
    getEvents(page: $page, roles: $roles) {
      alias
      EventDateTimeDescription
      audiences
      body_summary
      campus
      college_unit
      department
      email
      start_date
      end_date
      event_topics
      event_type
      event_units
      full_body
      image_title
      image_url
      interests
      locations
      nid
      title
      org_id
      organization_member_count
      organization_name
      organization_pic_url
      organization_website_url
    }
  }
`;

export const getEvents = graphql(GetEventsQuery, {
  options: props => {
    return {
      fetchPolicy: "cache-and-network",
      variables: {
        page: props.page ? props.page : 0,
        roles: props.roles ? props.roles : null
      }
    };
  },
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      events: props.data.getEvents,
      loadMore: props.data.fetchMore
    };
  }
});

export const GetNewsQuery = gql`
  query($page: Int, $roles: [String]) {
    getNews(page: $page, roles: $roles) {
      node {
        article_summary
        body
        field_asunews_contri_name
        field_hero_image_url
        field_imported_created
        field_interests
        field_news_teaser
        field_original_url
        field_saf
        field_sub_title
        title
      }
    }
  }
`;

export const getNews = graphql(GetNewsQuery, {
  options: props => ({
    fetchPolicy: "cache-and-network",
    variables: {
      page: props.page ? props.page : 0,
      roles: props.roles ? props.roles : null
    }
  }),
  props: props => {
    if (props.data.error) {
      console.log(props.data.error);
    }
    return {
      news: props.data.getNews,
      loadMore: props.data.fetchMore
    };
  }
});
