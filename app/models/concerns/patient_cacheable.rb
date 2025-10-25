# app/models/concerns/patient_cacheable.rb

module PatientCacheable
  extend ActiveSupport::Concern

  included do
    after_update :invalidate_patient_cache
    after_destroy :invalidate_patient_cache
  end

  class_methods do
    def find_cached(id, expires_in: 30.minutes)
      Rails.cache.fetch("patient/#{id}", expires_in: expires_in) do
        find(id)
      end
    end

    def all_cached(expires_in: 15.minutes)
      Rails.cache.fetch("patients/all", expires_in: expires_in) do
        all.to_a
      end
    end

    def active_cached(expires_in: 15.minutes)
      Rails.cache.fetch("patients/active", expires_in: expires_in) do
        active.to_a
      end
    end

    def search_cached(term, expires_in: 10.minutes)
      return all_cached if term.blank?

      cache_key = "patients/search/#{Digest::MD5.hexdigest(term)}"
      Rails.cache.fetch(cache_key, expires_in: expires_in) do
        search(term).to_a
      end
    end

    def by_city_cached(city, expires_in: 1.hour)
      return all_cached if city.blank?

      Rails.cache.fetch("patients/city/#{city}", expires_in: expires_in) do
        by_city(city).to_a
      end
    end

    def clear_all_cache
      Rails.cache.delete_matched("patient*")
    end
  end

  private

  def invalidate_patient_cache
    Rails.cache.delete("patient/#{id}")
    Rails.cache.delete_matched("patients/*")
  end
end
