import axios from "axios";

export const fetchShop = async (
  accessToken: string,
  entitlementsToken: string,
  userId: string
) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-Riot-Entitlements-JWT": entitlementsToken,
  };

  try {
    const response = await axios.get(
      `https://pd.${REGION}.a.pvp.net/store/v2/storefront/${userId}`,
      { headers }
    );
    const shopData = response.data as {
      FeaturedBundle: {
        Bundle: {
          DataAssetID: string;
          DisplayIcon: string;
        };
      };
      SkinsPanelLayout: {
        SingleItemOffers: {
          displayName: string;
          displayIcon: string;
          cost: number;
        }[];
        SingleItemOffersRemainingDurationInSeconds: number;
      };
    };
    const skinsList = {
      bundle_name: shopData.FeaturedBundle.Bundle.DataAssetID,
      bundle_image: shopData.FeaturedBundle.Bundle.DisplayIcon,
      skin1_name: shopData.SkinsPanelLayout.SingleItemOffers[0].displayName,
      skin1_image: shopData.SkinsPanelLayout.SingleItemOffers[0].displayIcon,
      skin1_price: shopData.SkinsPanelLayout.SingleItemOffers[0].cost,
      skin2_name: shopData.SkinsPanelLayout.SingleItemOffers[1].displayName,
      skin2_image: shopData.SkinsPanelLayout.SingleItemOffers[1].displayIcon,
      skin2_price: shopData.SkinsPanelLayout.SingleItemOffers[1].cost,
      skin3_name: shopData.SkinsPanelLayout.SingleItemOffers[2].displayName,
      skin3_image: shopData.SkinsPanelLayout.SingleItemOffers[2].displayIcon,
      skin3_price: shopData.SkinsPanelLayout.SingleItemOffers[2].cost,
      skin4_name: shopData.SkinsPanelLayout.SingleItemOffers[3].displayName,
      skin4_image: shopData.SkinsPanelLayout.SingleItemOffers[3].displayIcon,
      skin4_price: shopData.SkinsPanelLayout.SingleItemOffers[3].cost,
      SingleItemOffersRemainingDurationInSeconds:
        shopData.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds,
    };

    return skinsList;
  } catch (error) {
    console.error("Fetch shop error:", error);
    return null;
  }
};
