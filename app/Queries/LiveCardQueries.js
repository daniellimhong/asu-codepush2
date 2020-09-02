import gql from "graphql-tag";

/**
 * Pull the classes and all known data points associated.
 */
export const UserProfileQuery = gql`
  query UserProfile {
    getUserProfile {
      degree
      program
      college
    }
  }
`;

export const GetLiveCardsQuery = gql`
  query($lat: String, $lng: String, $iSearchData: Live_Card_iSearchData_Input) {
    getLiveCards(lat: $lat, lng: $lng, iSearchData: $iSearchData) {
      enabled
      order
      priority
      type
      location
      key_num
      stretchImage
      articleData {
        body
        button_text
        button_text_color
        button_text_card
        button_text_card_color
        field_hero_image_url
        field_imported_created
        field_interests
        field_news_teaser
        field_original_url
        field_saf
        field_saf_color
        title
        date_time
        full_body
        image_container_flex
        image_url
        nid
        locations
        link_from_lc
        body_summary
        alias
        start_date
        end_date
        map_title
        map_type
        map_coords {
          lat
          lng
        }
        text_background_color
        button {
          order
          title
          url
        }
      }
    }
  }
`;
