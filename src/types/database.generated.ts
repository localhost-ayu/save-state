
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "games": {
                  Row: {
                    "cover_url": string | null,"created_at": string,"created_by": string | null,"franchise": string | null,"genres": (string)[],"id": string,"igdb_id": number | null,"platforms": (string)[],"release_date": string | null,"slug": string | null,"source": Database["public"]['Enums']["game_source"],"summary": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cover_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"franchise"?: string | null,"genres"?: (string)[],"id"?: string,"igdb_id"?: number | null,"platforms"?: (string)[],"release_date"?: string | null,"slug"?: string | null,"source": Database["public"]['Enums']["game_source"],"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "cover_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"franchise"?: string | null,"genres"?: (string)[],"id"?: string,"igdb_id"?: number | null,"platforms"?: (string)[],"release_date"?: string | null,"slug"?: string | null,"source"?: Database["public"]['Enums']["game_source"],"summary"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"journal_entries": {
                  Row: {
                    "body": string,"created_at": string,"entry_date": string,"id": string,"is_private": boolean,"library_entry_id": string,"playthrough_id": string | null,"title": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"entry_date"?: string,"id"?: string,"is_private"?: boolean,"library_entry_id": string,"playthrough_id"?: string | null,"title"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"entry_date"?: string,"id"?: string,"is_private"?: boolean,"library_entry_id"?: string,"playthrough_id"?: string | null,"title"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "journal_entries_library_entry_id_fkey"
      columns: ["library_entry_id"]
isOneToOne: false
      referencedRelation: "library_entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "journal_entries_playthrough_id_fkey"
      columns: ["playthrough_id"]
isOneToOne: false
      referencedRelation: "playthroughs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "journal_entries_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"library_entries": {
                  Row: {
                    "board_position": number,"cover_crop": Json | null,"created_at": string,"custom_cover_path": string | null,"expectation": number | null,"favorite_position": number | null,"game_id": string,"id": string,"is_favorite": boolean,"is_platinum": boolean,"ownership": (Database["public"]['Enums']["ownership_type"])[],"platform": string | null,"priority": number,"rating": number | null,"status": Database["public"]['Enums']["game_status"],"status_changed_at": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "board_position"?: number,"cover_crop"?: Json | null,"created_at"?: string,"custom_cover_path"?: string | null,"expectation"?: number | null,"favorite_position"?: number | null,"game_id": string,"id"?: string,"is_favorite"?: boolean,"is_platinum"?: boolean,"ownership"?: (Database["public"]['Enums']["ownership_type"])[],"platform"?: string | null,"priority"?: number,"rating"?: number | null,"status"?: Database["public"]['Enums']["game_status"],"status_changed_at"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "board_position"?: number,"cover_crop"?: Json | null,"created_at"?: string,"custom_cover_path"?: string | null,"expectation"?: number | null,"favorite_position"?: number | null,"game_id"?: string,"id"?: string,"is_favorite"?: boolean,"is_platinum"?: boolean,"ownership"?: (Database["public"]['Enums']["ownership_type"])[],"platform"?: string | null,"priority"?: number,"rating"?: number | null,"status"?: Database["public"]['Enums']["game_status"],"status_changed_at"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "library_entries_game_id_fkey"
      columns: ["game_id"]
isOneToOne: false
      referencedRelation: "games"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "library_entries_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"playthroughs": {
                  Row: {
                    "created_at": string,"finished_on": string | null,"finished_precision": Database["public"]['Enums']["date_precision"],"hours": number | null,"id": string,"library_entry_id": string,"notes": string | null,"outcome": Database["public"]['Enums']["game_status"] | null,"started_on": string | null,"started_precision": Database["public"]['Enums']["date_precision"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"finished_on"?: string | null,"finished_precision"?: Database["public"]['Enums']["date_precision"],"hours"?: number | null,"id"?: string,"library_entry_id": string,"notes"?: string | null,"outcome"?: Database["public"]['Enums']["game_status"] | null,"started_on"?: string | null,"started_precision"?: Database["public"]['Enums']["date_precision"],"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"finished_on"?: string | null,"finished_precision"?: Database["public"]['Enums']["date_precision"],"hours"?: number | null,"id"?: string,"library_entry_id"?: string,"notes"?: string | null,"outcome"?: Database["public"]['Enums']["game_status"] | null,"started_on"?: string | null,"started_precision"?: Database["public"]['Enums']["date_precision"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "playthroughs_library_entry_id_fkey"
      columns: ["library_entry_id"]
isOneToOne: false
      referencedRelation: "library_entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "playthroughs_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "accent_color": string | null,"avatar_path": string | null,"background_path": string | null,"banner_path": string | null,"bio": string | null,"created_at": string,"display_name": string | null,"featured_entry_id": string | null,"id": string,"is_public": boolean,"links": NonNullable<Json>,"sections": NonNullable<Json>,"tagline": string | null,"theme": NonNullable<Json>,"updated_at": string,"username": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accent_color"?: string | null,"avatar_path"?: string | null,"background_path"?: string | null,"banner_path"?: string | null,"bio"?: string | null,"created_at"?: string,"display_name"?: string | null,"featured_entry_id"?: string | null,"id": string,"is_public"?: boolean,"links"?: NonNullable<Json>,"sections"?: NonNullable<Json>,"tagline"?: string | null,"theme"?: NonNullable<Json>,"updated_at"?: string,"username": string
                  }
                  Update: {
                    "accent_color"?: string | null,"avatar_path"?: string | null,"background_path"?: string | null,"banner_path"?: string | null,"bio"?: string | null,"created_at"?: string,"display_name"?: string | null,"featured_entry_id"?: string | null,"id"?: string,"is_public"?: boolean,"links"?: NonNullable<Json>,"sections"?: NonNullable<Json>,"tagline"?: string | null,"theme"?: NonNullable<Json>,"updated_at"?: string,"username"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_featured_entry_id_fkey"
      columns: ["featured_entry_id"]
isOneToOne: false
      referencedRelation: "library_entries"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "body": string,"created_at": string,"is_private": boolean,"library_entry_id": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"is_private"?: boolean,"library_entry_id": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"is_private"?: boolean,"library_entry_id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_library_entry_id_fkey"
      columns: ["library_entry_id"]
isOneToOne: true
      referencedRelation: "library_entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"screenshots": {
                  Row: {
                    "caption": string | null,"created_at": string,"height": number | null,"id": string,"is_private": boolean,"journal_entry_id": string | null,"library_entry_id": string,"storage_path": string,"taken_at": string | null,"user_id": string,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string | null,"created_at"?: string,"height"?: number | null,"id"?: string,"is_private"?: boolean,"journal_entry_id"?: string | null,"library_entry_id": string,"storage_path": string,"taken_at"?: string | null,"user_id"?: string,"width"?: number | null
                  }
                  Update: {
                    "caption"?: string | null,"created_at"?: string,"height"?: number | null,"id"?: string,"is_private"?: boolean,"journal_entry_id"?: string | null,"library_entry_id"?: string,"storage_path"?: string,"taken_at"?: string | null,"user_id"?: string,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "screenshots_journal_entry_id_fkey"
      columns: ["journal_entry_id"]
isOneToOne: false
      referencedRelation: "journal_entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "screenshots_library_entry_id_fkey"
      columns: ["library_entry_id"]
isOneToOne: false
      referencedRelation: "library_entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "screenshots_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_public_profile":
{ Args: { "profile_id": string }; Returns: boolean
                           },
"owns_library_entry":
{ Args: { "entry_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "date_precision": "day"|"month"|"year","game_source": "igdb"|"manual","game_status": "backlog"|"playing"|"paused"|"shelved"|"dropped"|"completed","ownership_type": "physical"|"digital"|"borrowed"|"alternative"|"subscription"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "date_precision": ["day", "month", "year"],"game_source": ["igdb", "manual"],"game_status": ["backlog", "playing", "paused", "shelved", "dropped", "completed"],"ownership_type": ["physical", "digital", "borrowed", "alternative", "subscription"]
          }
        }
} as const
